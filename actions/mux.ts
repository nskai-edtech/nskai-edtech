"use server";

import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { lessons, users, muxData } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const getMuxClient = () => {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    return null;
  }

  return new Mux({
    tokenId,
    tokenSecret,
  });
};

/**
 * Generate a secure Mux direct upload URL for a specific lesson.
 * Verifies that the user is a tutor and owns the course.
 */
export async function getDirectUploadUrl(lessonId: string) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { error: "Unauthorized" };
    }

    const mux = getMuxClient();

    if (!mux) {
      console.error(
        "[MUX_ACTION_ERROR] Mux client configuration missing. Check MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env.local",
      );
      return {
        error:
          "Video service is not configured (Missing Mux Keys). Please contact the administrator.",
      };
    }

    // Get user for permission check
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user || user.role !== "TUTOR") {
      return { error: "Permission denied. Only tutors can upload videos." };
    }

    // Verify ownership: lesson -> chapter -> course -> tutorId
    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        chapter: {
          with: {
            course: true,
          },
        },
      },
    });

    if (!lessonData || !lessonData.chapter?.course) {
      return { error: "Lesson not found" };
    }

    if (lessonData.chapter.course.tutorId !== user.id) {
      return { error: "Permission denied. You do not own this course." };
    }

    // Create Mux Direct Upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: lessonId,
      },
      cors_origin: "*",
    });

    // Saving the assetId immediately so polling can work even without webhooks
    if (upload.asset_id) {
      await db
        .insert(muxData)
        .values({
          lessonId,
          assetId: upload.asset_id,
        })
        .onConflictDoUpdate({
          target: muxData.lessonId,
          set: {
            assetId: upload.asset_id,
            playbackId: null, // Reset if re-uploading
          },
        });
    }

    return {
      success: true,
      url: upload.url,
      id: upload.id,
    };
  } catch (error) {
    console.error("[MUX_ACTION_ERROR]", error);
    return { error: "Internal Error" };
  }
}

/**
 * Checks if a lesson has an associated Mux asset.
 * Fallback: If no DB record exists, it checks the Mux Upload ID directly.
 */
export async function checkLessonVideoStatus(
  lessonId: string,
  uploadId?: string,
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    // 1. Try to find it in our database first
    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        muxData: true,
      },
    });

    if (data?.muxData?.playbackId) {
      return {
        muxData: data.muxData,
        isReady: true,
      };
    }

    // FALLBACK: If DB is empty or missing playbackId, check Mux directly
    const idToPoll = data?.muxData?.assetId || uploadId;

    if (idToPoll) {
      const mux = getMuxClient();
      if (mux) {
        let assetId = data?.muxData?.assetId;

        // If only uploadId exists, get assetId from the upload object
        if (!assetId && uploadId) {
          const upload = await mux.video.uploads.retrieve(uploadId);
          assetId = upload.asset_id || undefined;
        }

        if (assetId) {
          const asset = await mux.video.assets.retrieve(assetId);

          if (asset.status === "ready" && asset.playback_ids?.[0]) {
            const playbackId = asset.playback_ids[0].id;

            // Sync the DB manually
            const updatedMuxData = await db
              .insert(muxData)
              .values({
                lessonId,
                assetId: asset.id,
                playbackId: playbackId,
              })
              .onConflictDoUpdate({
                target: muxData.lessonId,
                set: {
                  assetId: asset.id,
                  playbackId: playbackId,
                },
              })
              .returning();

            return {
              muxData: updatedMuxData[0],
              isReady: true,
            };
          }
        }
      }
    }

    return {
      muxData: data?.muxData || null,
      isReady: false,
    };
  } catch (error) {
    console.error("[MUX_STATUS_ERROR]", error);
    return { error: "Internal Error" };
  }
}

/**
 * Fetch the auto-generated transcript for a Mux asset.
 *
 * Mux auto-generates captions/subtitles for assets with `"mp4_support": "standard"`.
 * The transcript text track is accessible via:
 *   https://stream.mux.com/{playbackId}/text/{trackId}.txt
 *
 */

import Mux from "@mux/mux-node";

function getMuxClient(): Mux | null {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) return null;
  return new Mux({ tokenId, tokenSecret });
}

export async function fetchMuxTranscript(
  assetId: string,
): Promise<string | null> {
  try {
    const mux = getMuxClient();
    if (!mux) {
      console.warn("[MUX_TRANSCRIPT] No Mux client — MUX_TOKEN_ID or MUX_TOKEN_SECRET env vars missing");
      return null;
    }

    // List text tracks on the asset
    const asset = await mux.video.assets.retrieve(assetId);
    const tracks = asset.tracks ?? [];

    // Find an auto-generated subtitle/caption text track
    const textTrack = tracks.find(
      (t) =>
        t.type === "text" &&
        (t.text_type === "subtitles" ||
         t.text_type === "captions" ||
         t.text_source === "generated_vod" ||
         t.text_source === "generated_live"),
    );

    if (!textTrack?.id) {
      const trackTypes = tracks.map((t) => `${t.type}/${t.text_type ?? "?"}/${t.text_source ?? "?"}`).join(", ");
      console.warn(`[MUX_TRANSCRIPT] No matching text track for asset ${assetId}. Available tracks: [${trackTypes}]`);
      return null;
    }

    // Get playback ID
    const playbackId = asset.playback_ids?.[0]?.id;
    if (!playbackId) {
      console.warn(`[MUX_TRANSCRIPT] No playback ID for asset ${assetId}`);
      return null;
    }

    const vttUrl = `https://stream.mux.com/${playbackId}/text/${textTrack.id}.vtt`;
    const res = await fetch(vttUrl);
    if (!res.ok) {
      console.warn(`[MUX_TRANSCRIPT] VTT fetch failed for asset ${assetId}: HTTP ${res.status}`);
      return null;
    }

    const vttText = await res.text();

    // Parse VTT to plain text (strip timestamps and headers)
    const transcript = parseVttToPlainText(vttText);
    if (!transcript) {
      console.warn(`[MUX_TRANSCRIPT] VTT parsed to empty text for asset ${assetId}`);
      return null;
    }

    console.log(`[MUX_TRANSCRIPT] Successfully fetched transcript for asset ${assetId} (${transcript.length} chars)`);
    return transcript;
  } catch (err) {
    console.error("[MUX_TRANSCRIPT_ERROR]", err);
    return null;
  }
}

/**
 * Convert WebVTT subtitle text to plain readable text.
 * Strips WEBVTT header, timestamps, and cue identifiers.
 */
function parseVttToPlainText(vtt: string): string {
  const lines = vtt.split("\n");
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === "WEBVTT") continue;
    if (trimmed.startsWith("NOTE")) continue;
    if (trimmed.startsWith("Kind:") || trimmed.startsWith("Language:"))
      continue;
    // Skip timestamp lines (e.g. "00:00:01.000 --> 00:00:04.000")
    if (/^\d{2}:\d{2}/.test(trimmed) && trimmed.includes("-->")) continue;
    // Skip numeric cue identifiers
    if (/^\d+$/.test(trimmed)) continue;

    textLines.push(trimmed);
  }

  // Deduplicate consecutive identical lines (common in VTT)
  const deduped: string[] = [];
  for (const line of textLines) {
    if (deduped[deduped.length - 1] !== line) {
      deduped.push(line);
    }
  }

  return deduped.join(" ").trim();
}

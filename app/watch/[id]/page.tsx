/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Mux from "@mux/mux-node";
import { VideoPlayer } from "@/components/video-player";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /* Get the asset metadata from your database here or directly from Mux like below. */
  const asset = await mux.video.assets.retrieve(id);

  return (
    <div className="p-8">
      <VideoPlayer playbackId={asset.playback_ids?.[0].id!} />
    </div>
  );
}

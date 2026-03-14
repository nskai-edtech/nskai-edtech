import { RtcRole, RtcTokenBuilder } from "agora-access-token";

type BuildTokenWithAccountArgs = {
  channelName: string;
  userAccount: string;
  role?: typeof RtcRole.PUBLISHER | typeof RtcRole.SUBSCRIBER;
  expiresInSeconds?: number;
};

type BuildTokenWithUidArgs = {
  channelName: string;
  uid: number;
  role?: typeof RtcRole.PUBLISHER | typeof RtcRole.SUBSCRIBER;
  expiresInSeconds?: number;
};

function getAgoraEnv() {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error("Missing Agora environment variables");
  }

  return { appId, appCertificate };
}

export function buildTokenWithUserAccount({
  channelName,
  userAccount,
  role = RtcRole.PUBLISHER,
  expiresInSeconds = 60 * 60,
}: BuildTokenWithAccountArgs) {
  const { appId, appCertificate } = getAgoraEnv();

  const currentTs = Math.floor(Date.now() / 1000);
  const expiresAt = currentTs + expiresInSeconds;

  const token = RtcTokenBuilder.buildTokenWithAccount(
    appId,
    appCertificate,
    channelName,
    userAccount,
    role,
    expiresAt,
  );

  return {
    token,
    expiresAt,
  };
}

export function buildTokenWithUid({
  channelName,
  uid,
  role = RtcRole.PUBLISHER,
  expiresInSeconds = 60 * 60,
}: BuildTokenWithUidArgs) {
  const { appId, appCertificate } = getAgoraEnv();

  const currentTs = Math.floor(Date.now() / 1000);
  const expiresAt = currentTs + expiresInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expiresAt,
  );

  return {
    token,
    expiresAt,
  };
}

export { RtcRole };
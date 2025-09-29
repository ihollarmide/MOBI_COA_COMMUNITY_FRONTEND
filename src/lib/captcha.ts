export async function getRecaptchaV3Token() {
  return new Promise<string | null>((resolve) => {
    grecaptcha.ready(async () => {
      const siteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_V3_SITE_KEY;

      if (!siteKey) {
        resolve(null);
        return;
      }

      const token = await grecaptcha.execute(siteKey, {
        action: "connect_wallet_to_coa_airdrop",
      });

      resolve(token);
    });
  });
}

export async function verifyRecaptchaToken({
  token,
  secretKey,
}: {
  token: string;
  secretKey?: string;
}) {
  if (!secretKey) {
    throw new Error("reCAPTCHA Secret Key Found");
  }

  const url = new URL("https://www.google.com/recaptcha/api/siteverify");
  url.searchParams.append("secret", secretKey);
  url.searchParams.append("response", token);

  const res = await fetch(url, {
    method: "POST",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  return data;
}

// Specific function for v3 verification
export async function verifyRecaptchaV3Token(
  token: string
): Promise<CaptchaV3Response | null> {
  return verifyRecaptchaToken({
    token,
    secretKey: process.env.GOOGLE_RECAPTCHA_V3_SECRET_KEY,
  });
}

// Specific function for v2 verification
export async function verifyRecaptchaV2Token(
  token: string
): Promise<CaptchaV2Response | null> {
  return verifyRecaptchaToken({
    token,
    secretKey: process.env.GOOGLE_RECAPTCHA_V2_SECRET_KEY,
  });
}

// Type Definitions
type CaptchaV3Response =
  | {
      success: true;
      score: number;
      action: string;
      challenge_ts: string;
      hostname: string;
    }
  | {
      success: false;
      "error-codes": string[];
    };

type CaptchaV2Response =
  | {
      success: true;
      challenge_ts: string;
      hostname: string;
    }
  | {
      success: false;
      "error-codes": string[];
    };

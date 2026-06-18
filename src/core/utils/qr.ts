import QRCode from 'qrcode';

/**
 * Generates a secure, time-limited QR code for TEKH+ transactions or rewards.
 * 
 * @param transactionId - The ID of the transaction (UUID) or reward (REWARD_*)
 * @param userId - The ID of the user
 * @param canvasElementId - The ID of the canvas element to render into
 * @returns Object indicating success and expiration time
 */
export async function generateSecureTransactionQR(
    transactionId: string,
    userId: string,
    canvasElementId: string
) {
    try {
        const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas element "${canvasElementId}" not found.`);
        }

        // Validity: 5 minutes (300,000ms)
        const validityDuration = 5 * 60 * 1000;
        const expiresAt = Date.now() + validityDuration;

        // Condensed payload for faster scanning
        const qrPayload = {
            tId: transactionId,
            uId: userId,
            exp: expiresAt
        };

        const payloadString = JSON.stringify(qrPayload);

        const qrOptions = {
            errorCorrectionLevel: 'H' as const,
            margin: 2,
            width: 256,
            color: {
                dark: '#16a34a', // TEKH+ Eco Green
                light: '#ffffff'
            }
        };

        await QRCode.toCanvas(canvas, payloadString, qrOptions);

        return { success: true, expiresAt, error: null };
    } catch (err: any) {
        console.error("QR Generation failed:", err.message);
        return { success: false, expiresAt: null, error: err.message };
    }
}

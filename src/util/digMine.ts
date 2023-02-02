import jwt from "jsonwebtoken";

const PRIVATE_KEY =
"-----BEGIN EC PARAMETERS-----\nBggqhkjOPQMBBw==\n-----END EC PARAMETERS-----\n-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDB7KMVQd+eeKt7AwDMMUaT7DE3Sl0Mto3LEojnEkRiAoAoGCCqGSM49\nAwEHoUQDQgAEEkViJDU8lYJUenS6IxPlvFJtUCDNF0c/F/cX07KCweC4Q/nOKsoU\nnYJsb4O8lMqNXaI1j16OmXk9CkcQQXbzfg==\n-----END EC PRIVATE KEY-----\n";

export function generateXTTGameId(gameId: string): string {

    const token = jwt.sign(
        {
            gameId: gameId,
            time: new Date().getTime()
        },
        PRIVATE_KEY,
        {
            algorithm: "ES256",
            expiresIn: 2592e3,
            header: {
                alg: "ES256",
                typ: "JWT"
            }
        })

    return token;
}
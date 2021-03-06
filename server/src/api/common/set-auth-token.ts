import { Request, Response } from 'express';
import * as ms from 'ms';

import { AuthOptions } from '../../config/vendure-config';

/**
 * Sets the authToken either as a cookie or as a response header, depending on the
 * config settings.
 */
export function setAuthToken(options: {
    authToken: string;
    rememberMe: boolean;
    authOptions: Required<AuthOptions>;
    req: Request;
    res: Response;
}) {
    const { authToken, rememberMe, authOptions, req, res } = options;
    if (authOptions.tokenMethod === 'cookie') {
        if (req.session) {
            if (rememberMe) {
                req.sessionOptions.maxAge = ms('1y');
            }
            req.session.token = authToken;
        }
    } else {
        res.set(authOptions.authTokenHeaderKey, authToken);
    }
}

const jwt = require('jsonwebtoken');
const db = require('../config/db');

function getBearerToken(req){
    const header = req.headers.authorization || '';
    if(!header.startsWith('Bearer ')){
        return null;
    }
    const token = header.slice(7).trim();
    return token || null;
}
/*require authentication */

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = getBearerToken(req); /*header.startsWith('Bearer ') ? header.slice(7) : null; */

    if (!token) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );
        if(!payload.sub){
            return res.status(401).json({
                error: 'Invalid token.'
            });
        }
        req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

/*optional authentication */
function optionalAuth(req, res, next) {
                                                        /*const header = req.headers.authorization || '';*/
    const token = getBearerToken(req);                  /*header.startsWith('Bearer ') ? header.slice(7) : null;*/
    if (!token) {
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );
        req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
    } catch (err) {
        // Invalid optional token is treated as unauthenticated.
    }
    next();
}


async function requireAdmin(req, res, next) {
    /*if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }*/
    if(!req.user){
        return res.status(401).json({
            error: 'Authentication required.'
        });
    }
    try{
        // Check the current database role instead of
        // trusting an old role stored inside the JWT.
        const result = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [req.user.id]
        );
        if(!result.rows.length){
            return res.status(401).json({
                error: 'User account not found.'
            });
        }
        const currentRole = result.rows[0].role;
        if (currentRole !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required.'
            });
        }
        // Keep req.user synchronized with the database.
        req.user.role = currentRole;
        next();
    }catch(err){
        console.error(err);
        return res.status(500).json({
            error: 'Could not verify admin access.'
        });
    }
    
}

module.exports = { requireAuth, optionalAuth, requireAdmin };

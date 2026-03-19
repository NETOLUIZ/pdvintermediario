/**
 * Middleware de controle de acesso por perfil.
 * Uso: roleMiddleware('ADMIN', 'OPERADOR_CAIXA')
 */
function roleMiddleware(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        error: 'Acesso negado. Perfil sem permissão para esta ação.',
        perfil: req.usuario.perfil,
        requerido: perfisPermitidos,
      });
    }
    next();
  };
}

module.exports = roleMiddleware;

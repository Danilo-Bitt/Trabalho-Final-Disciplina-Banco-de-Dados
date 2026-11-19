const DashboardModel = require('../models/DashboardModel');

class DashboardController {
  static async obterDashboard(req, res, next) {
    try {
      const dados = await DashboardModel.obterDadosDashboard();
      return res.status(200).json(dados);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;

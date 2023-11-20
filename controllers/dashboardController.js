//For Register Page
const dashboardView = (req, res) => {
  console.log(req.user);
    res.render("dashboard", {
      user: req.user
    });
  };
  module.exports = {
    dashboardView,
  };
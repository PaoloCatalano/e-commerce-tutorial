const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication"); //per controllare se l'user é autenticato
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions("admin", "owner" /* vari ruoli possibili */),
    getAllUsers
  );
router.route("/showMe").get(authenticateUser, showCurrentUser);
//patch, NO post perche si tratta di updating
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
//deve stare alla fine perche se no tutte le path dopo :id saranno considerati degli specifici params di :id
/* Esempio: 
{
    "id": "showMe"
} */

router.route("/:id").get(authenticateUser, getSingleUser);
/* Esempio: 
{
    "id": "0123456789"
} */

module.exports = router;

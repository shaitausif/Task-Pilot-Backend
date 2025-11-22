import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes } from "../controllers/notes.controller.js";
import { createNoteValidator, searchNotesValidator } from "../validators/note.validator.js";
import { validate } from "../validators/validate.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";

const router = Router();


router.use(authenticateJWT)


router.route("/create").post(createNoteValidator, validate, createNote);

router.route("/get-notes").get(getNotes);

router.route("/get-note-by-id/:id").get(mongoIdPathVariableValidator("id"), validate, getNoteById);

router.route("/update-note/:id").patch(mongoIdPathVariableValidator("id"), validate, updateNote);

router.route("/delete-note/:id").delete(mongoIdPathVariableValidator("id"), validate, deleteNote);

router.route("/search").get(searchNotesValidator, validate, searchNotes);

export default router;

import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes } from "../controllers/notes.controller.js";
import { createNoteValidator, noteIdParamValidator, updateNoteValidator, searchNotesValidator } from "../validators/note.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();


router.use(authenticateJWT)


router.route("/create").post(createNoteValidator, validate, createNote);

router.route("/get-notes").get(getNotes);

router.route("/get-note-by-id/:id").get(noteIdParamValidator("id"), validate, getNoteById);

router.route("/update-note/:id").patch(updateNoteValidator("id"), validate, updateNote);

router.route("/delete-note/:id").delete(noteIdParamValidator("id"), validate, deleteNote);

router.route("/search").get(searchNotesValidator, validate, searchNotes);

export default router;

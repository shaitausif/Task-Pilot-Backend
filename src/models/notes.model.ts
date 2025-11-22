import mongoose, { Document, Schema } from "mongoose";


enum Tag {
    Work = "Work",
    Personal = "Personal"
}


export interface NotesInterface extends Document{
    title : string;
    content : string;
    tag : Tag;
    user : Schema.Types.ObjectId,
    createdAt : Date;
    updatedAt : Date
}


const notesSchema = new Schema<NotesInterface>(
    {
        title : {
            type : String,
            required : true
        },
        content : {
            type : String,
            required : true
        },
        tag : {
            type : String,
            default : Tag.Personal,
            enum : Object.values(Tag)
        },
        user : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }, {
        timestamps : true
    }
)


export const Notes = mongoose.models.Notes || mongoose.model<NotesInterface>("Notes",notesSchema)
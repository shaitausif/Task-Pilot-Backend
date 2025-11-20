import mongoose, { Document, Schema } from "mongoose";


enum Tags {
    Work = "Work",
    Personal = "Personal"
}


export interface NotesInterface extends Document{
    title : string;
    content : string;
    tags : Tags;
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
        tags : {
            type : String,
            default : Tags.Personal,
            enum : Object.values(Tags)
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
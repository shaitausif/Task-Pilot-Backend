import mongoose, { Document, Schema } from "mongoose";


enum ProjectStatus {
    Active = "Active",
    OnHold = "On Hold",
    Completed = "Completed"
}

export interface ProjectInterface extends Document {
    name : String;
    description : String;
    status : ProjectStatus;
    tasks : Schema.Types.ObjectId[],
    user : Schema.Types.ObjectId,
    createdAt : Date;
    updatedAt : Date;
}


const projectSchema = new Schema<ProjectInterface>(
    {
        name : {
            type : String,
            required : true,
        },
        description : {
            type : String,
            required : true
        },
        status : {
            type : String,
            required : true,
            default : ProjectStatus.Active,
            enum : Object.values(ProjectStatus)
        },
        tasks : [
            {
                type : Schema.Types.ObjectId,
                ref : "Task"
            }
        ],
        user : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
    }, {
        timestamps : true
    }
)


export const Project = mongoose.models.Project || mongoose.model<ProjectInterface>("Project",projectSchema)
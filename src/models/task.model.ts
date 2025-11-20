import mongoose, { Document, Schema } from "mongoose";



enum Status {
  Pending = "Pending",
  InProgress = "In-Progress",
  Completed = "Completed",
}

enum Priority {
  low = "Low",
  medium = "Medium",
  high = "High"
}



export interface TaskInterface extends Document{
    title : string;
    description : string;
    status : Status;
    priority : Priority;
    dueDate : Date;
    user : Schema.Types.ObjectId;
    createdAt : Date;
    updatedAt : Date;    
}


const taskSchema = new Schema<TaskInterface>(
  {
    title : {
      type : String,
      required : true
    },
    description : {
      type : String,
      required : true
    },
    status : {
      type : String,
      required : true,
      default : Status.Pending,
      enum : Object.values(Status)
    },
    priority : {
      type : String,
      required : true,
      default : Priority.medium,
      enum : Object.values(Priority)
    },
    dueDate : {
      type : Date,
      default : () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day 
    },
    user : {  
      type : Schema.Types.ObjectId,
      ref : "User"
    }
  }, { 
    timestamps : true
  }
)


export const Task = mongoose.models.Task || mongoose.model<TaskInterface>("Task",taskSchema)
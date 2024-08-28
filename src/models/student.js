import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String
    },
    relationship: {
        type: String
    },
    address: {
        type: String
    }
});

const termSchema = new mongoose.Schema({
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true
  },
  subjects: [
    {
      subject: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        required: true
      }
    }
  ]
});

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  terms: [termSchema]
});

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String
    },
    state: {
        type: String
    },
    LGA: {
        type: String
    },
    profileImage: {
        type: String
    },
    parentOrGuardianDetails: [guardianSchema],
    login: {
        type: String
    },
    registrationNumber: {
        type: String
    },
    currentClass: {
        type: String
    },
    result: [classSchema],
    schoolFees: {
        type: Boolean,
        default: false
    }
});    

const Profile = mongoose.model('Profile', studentSchema);

export default Profile;

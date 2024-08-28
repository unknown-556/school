import Profile from "../models/student.js";
import User from "../models/userModel.js";
import crypto from 'crypto'
import cryptoHash from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const hashValue = (value) => {
        const hash = cryptoHash.createHash('sha256');
        hash.update(value);
        return hash.digest('hex');
    };

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const addStudent = async (req, res) => {
    try {
        const { RegistrationNumber, profileImage } = req.body;

        const existingProfile = await Profile.findOne({ RegistrationNumber });

        if (existingProfile) {
            return res.status(400).json({ message: 'There is already a student with this registration number.' });
        }

        const login = crypto.randomBytes(8).toString('hex');
        const hashedLogin = hashValue(login);

        let imageUrl = "";

        if (profileImage) {
            const uploadResponse = await cloudinary.uploader.upload(profileImage, {
                resource_type: 'image',
            });
            imageUrl = uploadResponse.secure_url;
        }

        const profile = new Profile({
            ...req.body,
            login: hashedLogin,
            profileImage: imageUrl,
        });

        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('INTERNAL SERVER ERROR:', error.message);
    }
};



export const addResult = async (req, res) => {
    try {
        const {RegistrationNumber} = req.params
        const { className, term, subject, score } = req.body;

        const profile = await Profile.findOne({ RegistrationNumber });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        let classResult = profile.result.find(result => result.className === className);

        if (!classResult) {
            classResult = {
                className: className,
                terms: []
            };
            profile.result.push(classResult);
        }

        let termResult = classResult.terms.find(t => t.term === term);

        if (!termResult) {
            termResult = {
                term: term,
                subjects: []
            };
            classResult.terms.push(termResult);
        }

        let subjectResult = termResult.subjects.find(s => s.subject === subject);

        if (subjectResult) {
            subjectResult.score = score;
        } else {
            termResult.subjects.push({
                subject: subject,
                score: score
            });
        }

        await profile.save();

        res.status(200).json({ message: 'Result added successfully', profile });

    } catch (error) {
        console.error('INTERNAL SERVER ERROR:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const getProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().select("-login");

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ message: "No profiles found", data: [] });
        }

        res.status(200).json({ message: "Profiles retrieved successfully", data: profiles });
    } catch (error) {
        console.error('Error while retrieving profiles:', error.message);
        res.status(500).json({ message: "An error occurred while fetching profiles" });
    }
};



export const profile = async (req, res) => {
    try {
        const {profileId} = req.params.id
        const profiles = await Profile.findById(profileId).select("-login");

        if (profiles.length === 0) {
            return res.status(404).json({ message: "No profiles found" });
        }

        res.status(200).json({ message: "Profiles found successfully", profiles });
    } catch (error) {
        console.error('Error while getting all profiles:', error.message);
        res.status(500).json({ message: "An error occurred while fetching profiles", error: error.message });
    }
};


export const getClass = async (req, res) => {
    try {
        const { currentClass } = req.params;

        const profiles = await Profile.find({ currentClass }).select("-login");

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ message: "No profiles found for the specified class", data: [] });
        }

        res.status(200).json({ message: "Profiles retrieved successfully", data: profiles });
    } catch (error) {
        console.error('Error while retrieving profiles:', error.message);
        res.status(500).json({ message: "An error occurred while fetching profiles" });
    }
};



export const getClassProfiles = async (req, res) => {
    try {
        const teacher = await User.findById(req.user._id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const currentClass = teacher.currentClass;

        if (!currentClass) {
            return res.status(400).json({ message: 'class not assigned to teacher' });
        }

        const profiles = await Profile.find({ currentClass }).select("-login");

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'No profiles found for this class' });
        }

        res.status(200).json({ message: 'Profiles found successfully', profiles });
    } catch (error) {
        console.error('Error while getting profiles by class:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


export const updateStudentClass = async (req, res) => {
    try {
        const {RegistrationNumber} = req.params
        const {  newClass } = req.body;

        const student = await Profile.findOne({ RegistrationNumber });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        student.currentClass = newClass;

        const updatedProfile = await student.save();

        res.status(200).json({ message: 'Student class updated successfully', profile: updatedProfile });
    } catch (error) {
        console.error('Error while updating student class:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


export const assignClass = async (req, res) => {
    try {
        const userId = req.params.id
        const {  newClass } = req.body;

        const teacher = await User.findOne(userId);

        if (!teacher) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        teacher.currentClass = newClass;

        const updatedProfile = await student.save();

        res.status(200).json({ message: 'Student class updated successfully', profile: updatedProfile });
    } catch (error) {
        console.error('Error while updating student class:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


export const updateClassForAllProfiles = async (req, res) => {
    try {
        const { oldClass, newClass } = req.body;

        if (!oldClass || !newClass) {
            return res.status(400).json({ message: 'Old class and new class are required' });
        }

        const result = await Profile.updateMany(
            { currentClass: oldClass },
            { $set: { currentClass: newClass } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No profiles found with the specified old class' });
        }

        res.status(200).json({ message: 'Class updated successfully for all matching profiles', updatedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error while updating class for all profiles:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
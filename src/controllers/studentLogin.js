import Profile from "../models/student.js";
import generateStudentTokenAndSetCookie from '../utils/student.js';
import crypto from 'crypto';


const hashValue = (value) => {
    const hash = crypto.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
};


function comparePasswords(inputPassword, hashedPassword) {
    return hashValue(inputPassword) === hashedPassword;
}

export const signIn = async (req, res) => {
    try {
        const { RegistrationNumber, login } = req.body;
        const student = await Profile.findOne({ RegistrationNumber });

        if (!student) {
            return res.status(400).json({ message: 'User with this Registration Number not found' });
        }

        const comparePass = comparePasswords(login, user.login);
        if (!comparePass) {
            return res.status(400).json({ message: 'Login is incorrect' });
        }

        const studentToken = generateStudentTokenAndSetCookie(student._id, res);

        res.status(200).json({ message: 'User login successful', studentToken });
        console.log('User login successful', studentToken);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('INTERNAL SERVER ERROR:', error.message);
    }
};


export const profile = async (req, res) => {
    try {
        const {profileId} = req.user.id
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

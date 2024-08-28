import User from "../models/userModel.js";
import cryptoHash from 'crypto'
import { signInValidator, signUpValidator } from "../validators/authValidators.js";
import { formatZodError } from "../utils/errorMessage.js";
import generateTokenAndSetCookie from "../utils/jwt.js";
import transporter from '../config/email.js'


function hashValue(value) {
    const hash = cryptoHash.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
}
 
 function comparePasswords(inputPassword, hashedPassword) {
    return hashValue(inputPassword) === hashedPassword;
}


export const signUp = async (req, res) => {
    const registerResults = signUpValidator.safeParse(req.body)
    if (!registerResults) {
        return res.status(400).json(formatZodError(registerResults.error.issues))
    }
    try {
        const { email}=req.body 
        const user = await User.findOne({for:[{email}]})
        if (user) {
            res.status(409).json({messaage:'User with email already exists'})
        } else {
            const {
                firstName,
                lastName,
                phoneNumber,
                password,
                email,
            } = req.body
   
            const encryption = hashValue(password)
            const newUser = new User({
                firstName,
                lastName,
                phoneNumber,
                password: encryption,
                email,
            })
            await newUser.save()

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: newUser.email, 
                subject: 'New Portfolio Created',
                text: `A new portfolio has been created with this email. If you did not request this , please contact us at example@gmail.com`
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent successfully:', info.response);
                }
            });


            res.status(200).json({message: 'User registered succesfully',newUser})
            console.log('User registered succesfully',newUser);
        }
    } catch (error) {
        res.status(500).json({message: error.message})
        console.log('INTERNAL SERVER ERROR',error.message)
    }
}


export const signIn = async (req, res, next) => {
    const loginResults = signInValidator.safeParse(req.body);
    if (!loginResults.success) {
        return res.status(400).json(formatZodError(loginResults.error.issues));
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User with email not found' });
        }

        if (user.isFrozen) {
            return res.status(403).json({ message: 'Your account is frozen. Please contact support.' });
        }

        const comparePass = comparePasswords(password, user.password);
        if (!comparePass) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        const accessToken = generateTokenAndSetCookie(user._id, res);

        res.status(200).json({ message: 'User Login successful', accessToken });
        console.log('User Login successful', accessToken);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('INTERNAL SERVER ERROR', error.message);
    }
};

export const logout = async (req, res, next) => {
    try {
      res.clearCookie('jwt');
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };
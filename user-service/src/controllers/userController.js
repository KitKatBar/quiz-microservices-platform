const Profile = require("../models/Profile");

async function getMyProfile(req, res) {
    try {
        const profile = await Profile.findOne({
            authUserId: req.user.userId
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            profile
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to retrieve profile"
        });
    }
}

async function updateMyProfile(req, res) {
    try {
        const {
            firstName,
            lastName,
            displayName,
            bio,
            avatarUrl
        } = req.body;

        let profile = await Profile.findOne({
            authUserId: req.user.userId
        });

        if (!profile) {
            if (!firstName || !lastName || !displayName) {
                return res.status(400).json({
                    message:
                    "firstName, lastName, and displayName are required when creating a profile"
                });
        }

        profile = await Profile.create({
            authUserId: req.user.userId,
            firstName,
            lastName,
            displayName,
            bio,
            avatarUrl
        });

        return res.status(201).json({
            message: "Profile created",
            profile
        });
        }

        if (firstName !== undefined) profile.firstName = firstName;
        if (lastName !== undefined) profile.lastName = lastName;
        if (displayName !== undefined) profile.displayName = displayName;
        if (bio !== undefined) profile.bio = bio;
        if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

        await profile.save();

        return res.status(200).json({
            message: "Profile updated",
            profile
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(400).json({
            message: "Unable to update profile",
            error: error.message
        });
    }
}

async function getPublicProfile(req, res) {
    try {
        const profile = await Profile.findOne({
            authUserId: req.params.id
        }).select("displayName bio avatarUrl createdAt");

        if (!profile) {
            return res.status(404).json({
                message: "Public profile not found"
            });
        }

        return res.status(200).json({
            profile
        });
    } catch (error) {
        console.error("Get public profile error:", error);

        return res.status(500).json({
            message: "Unable to retrieve public profile"
        });
    }
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    getPublicProfile
};
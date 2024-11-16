/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         isCreated:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         companyLicenseNo:
 *           type: string
 *         companyNameEn:
 *           type: string
 *         companyNameAr:
 *           type: string
 *         landline:
 *           type: string
 *         mobile:
 *           type: string
 *         country:
 *           type: string
 *         region:
 *           type: string
 *         city:
 *           type: string
 *         zipCode:
 *           type: string
 *         streetAddress:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 500
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: An error occurred while processing your request
 *         data:
 *           type: null
 *
 * tags:
 *   name: User
 *   description: User management and email verification endpoints
 *
 * /api/user/v1/send-otp:
 *   post:
 *     summary: Send OTP for email verification
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Email already registered or invalid email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to send OTP email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/user/v1/verify-otp:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 pattern: ^\d{4}$
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/user/v1/create:
 *   post:
 *     summary: Create user with full information
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - companyLicenseNo
 *               - companyNameEn
 *               - companyNameAr
 *               - mobile
 *               - country
 *               - region
 *               - city
 *               - zipCode
 *               - streetAddress
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               companyLicenseNo:
 *                 type: string
 *               companyNameEn:
 *                 type: string
 *               companyNameAr:
 *                 type: string
 *               landline:
 *                 type: string
 *               mobile:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               city:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Email not verified or user already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to send welcome email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

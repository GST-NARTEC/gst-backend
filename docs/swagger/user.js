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
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Flag indicating if the user account is active
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
 *     UserComplete:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             cart:
 *               $ref: '#/components/schemas/Cart'
 *             orders:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *             invoices:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *
 *     UserOrders:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         orders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *
 *     UserCart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         cart:
 *           $ref: '#/components/schemas/Cart'
 *
 *     UserInvoices:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         invoices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Invoice'
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
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
 *         longitude:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *
 * /api/user/v1/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/user/v1/search:
 *   get:
 *     summary: Search users with pagination
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for email, company name, or license number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [email, companyNameEn, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *
 * /api/user/v1/{id}:
 *   get:
 *     summary: Get user information
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: fields
 *         required: false
 *         schema:
 *           type: string
 *           enum: [orders, cart, invoices, profile, docs]
 *         description: Specific field to retrieve. If not provided, returns all user data
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: User details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/UserComplete'
 *                         - $ref: '#/components/schemas/UserOrders'
 *                         - $ref: '#/components/schemas/UserCart'
 *                         - $ref: '#/components/schemas/UserInvoices'
 *                         - $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a user and all related data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User and all related data deleted successfully
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Validation error or duplicate company details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/user/v1/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: Generates new access and refresh tokens using a valid refresh token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token obtained during login
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
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
 *                   example: Tokens refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New access token
 *                     refreshToken:
 *                       type: string
 *                       description: New refresh token
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid refresh token
 *                 data:
 *                   type: null
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 data:
 *                   type: null
 *
 * /api/user/v1/{id}/status:
 *   patch:
 *     summary: Update user account status
 *     description: Activate or suspend a user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Action to perform on the account
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *                   example: User activated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid action parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *
 * /api/user/v1/{id}/gtins:
 *   get:
 *     tags: [User]
 *     summary: Get user's GTINs
 *     description: Retrieve GTINs assigned to a specific user through their completed orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Assigned, Used]
 *         description: Filter GTINs by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, gtin]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved user's GTINs
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
 *                   example: User GTINs retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     gtins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           gtin:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [Available, Assigned, Used]
 *                           assignedAt:
 *                             type: string
 *                             format: date-time
 *                           orderNumber:
 *                             type: string
 *                           orderDate:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of GTINs
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                         hasMore:
 *                           type: boolean
 *                           description: Whether there are more pages
 *       400:
 *         description: Bad request (invalid query parameters)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 * /api/user/v2/create-with-checkout:
 *   post:
 *     tags: [User]
 *     summary: Create user with cart and process checkout
 *     description: Creates a new user with cart items and initiates the checkout process
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - companyNameEn
 *               - companyNameAr
 *               - mobile
 *               - country
 *               - region
 *               - city
 *               - cartItems
 *               - paymentType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "sairatecsolutions@gmail.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "sairatec"
 *               companyNameEn:
 *                 type: string
 *                 example: "Sairatec"
 *               companyNameAr:
 *                 type: string
 *                 example: "Sairatec"
 *               landline:
 *                 type: string
 *                 example: "+923005447070"
 *               mobile:
 *                 type: string
 *                 example: "+923005447070"
 *               country:
 *                 type: string
 *                 example: "1"
 *               region:
 *                 type: string
 *                 example: "1"
 *               city:
 *                 type: string
 *                 example: "1"
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: "0377bb56-d822-4418-995d-024c079d92d4"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                     addons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - id
 *                           - quantity
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "115dc244-79e3-434d-8d67-9a3e2b725f68"
 *                           quantity:
 *                             type: integer
 *                             minimum: 1
 *                             example: 1
 *               paymentType:
 *                 type: string
 *                 example: "Bank Transfer"
 *               vat:
 *                 type: number
 *                 minimum: 0
 *                 example: 400
 *     responses:
 *       201:
 *         description: User created and checkout initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered and checkout initiated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         companyNameEn:
 *                           type: string
 *                         companyNameAr:
 *                           type: string
 *                         cart:
 *                           type: object
 *                           properties:
 *                             items:
 *                               type: array
 *                               items:
 *                                 type: object
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

// docs/swagger/userGuide.js
/**
 * @swagger
 * /api/v1/user-guides:
 *   post:
 *     summary: Create a new user guide
 *     tags: [User Guides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *                 description: Title in English
 *               titleAr:
 *                 type: string
 *                 description: Title in Arabic
 *               descriptionEn:
 *                 type: string
 *                 description: Description in English
 *               descriptionAr:
 *                 type: string
 *                 description: Description in Arabic
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file (mutually exclusive with video)
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (mutually exclusive with pdf)
 *     responses:
 *       201:
 *         description: User guide created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGuideResponse'
 *       400:
 *         description: Invalid input or missing required files
 *
 *   get:
 *     summary: Get all user guides with pagination, search, and filtering
 *     tags: [User Guides]
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for titles and descriptions (in both languages)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pdf, video]
 *         description: Filter by file type (pdf or video)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, titleEn, titleAr]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Preferred language for response
 *     responses:
 *       200:
 *         description: Successfully retrieved user guides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGuidesListResponse'
 *
 * /api/v1/user-guides/{id}:
 *   get:
 *     summary: Get a user guide by ID
 *     tags: [User Guides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Preferred language for response
 *     responses:
 *       200:
 *         description: User guide details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGuideResponse'
 *
 *   put:
 *     summary: Update a user guide
 *     tags: [User Guides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionAr:
 *                 type: string
 *               pdf:
 *                 type: string
 *                 format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User guide updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGuideResponse'
 *
 *   delete:
 *     summary: Delete a user guide
 *     tags: [User Guides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User guide deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserGuideResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             titleEn:
 *               type: string
 *             titleAr:
 *               type: string
 *             descriptionEn:
 *               type: string
 *             descriptionAr:
 *               type: string
 *             link:
 *               type: string
 *             type:
 *               type: string
 *               enum: [application/pdf, video/mp4]
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     UserGuidesListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User guides retrieved
 *         data:
 *           type: object
 *           properties:
 *             guides:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   link:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [application/pdf, video/mp4]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProService:
 *       type: object
 *       required:
 *         - titleEn
 *         - titleAr
 *         - descriptionEn
 *         - descriptionAr
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         titleEn:
 *           type: string
 *           description: Title in English
 *         titleAr:
 *           type: string
 *           description: Title in Arabic
 *         descriptionEn:
 *           type: string
 *           description: Description in English
 *         descriptionAr:
 *           type: string
 *           description: Description in Arabic
 *         image:
 *           type: string
 *           description: Image URL
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *           description: Status (0 = inactive, 1 = active)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/pro-services/v1:
 *   post:
 *     summary: Create a new pro service
 *     security:
 *       - bearerAuth: []
 *     tags: [ProServices]
 *     requestBody:
 *       required: true
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
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       201:
 *         description: Pro Service created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all pro services
 *     tags: [ProServices]
 *     responses:
 *       200:
 *         description: List of pro services retrieved successfully
 *
 * /api/pro-services/v1/active:
 *   get:
 *     summary: Get all active pro services
 *     tags: [ProServices]
 *     responses:
 *       200:
 *         description: List of active pro services retrieved successfully
 *
 * /api/pro-services/v1/{id}:
 *   get:
 *     summary: Get a pro service by ID
 *     tags: [ProServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pro Service retrieved successfully
 *       404:
 *         description: Pro Service not found
 *
 *   put:
 *     summary: Update a pro service
 *     security:
 *       - bearerAuth: []
 *     tags: [ProServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
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
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Pro Service updated successfully
 *       404:
 *         description: Pro Service not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a pro service
 *     security:
 *       - bearerAuth: []
 *     tags: [ProServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pro Service deleted successfully
 *       404:
 *         description: Pro Service not found
 *       401:
 *         description: Unauthorized
 */

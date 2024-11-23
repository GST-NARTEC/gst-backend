/**
 * @swagger
 * components:
 *   schemas:
 *     Slider:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         titleEn:
 *           type: string
 *         titleAr:
 *           type: string
 *         descriptionEn:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         captionEn:
 *           type: string
 *         captionAr:
 *           type: string
 *         imageEn:
 *           type: string
 *         imageAr:
 *           type: string
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/slider/v1:
 *   post:
 *     tags: [Sliders]
 *     summary: Create a new slider
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
 *               captionEn:
 *                 type: string
 *               captionAr:
 *                 type: string
 *               imageEn:
 *                 type: string
 *                 format: binary
 *               imageAr:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       201:
 *         description: Slider created successfully
 *
 *   get:
 *     tags: [Sliders]
 *     summary: Get all sliders
 *     responses:
 *       200:
 *         description: List of sliders retrieved successfully
 *
 * /api/slider/v1/active:
 *   get:
 *     tags: [Sliders]
 *     summary: Get all active sliders
 *     responses:
 *       200:
 *         description: List of active sliders retrieved successfully
 *
 * /api/slider/v1/{id}:
 *   get:
 *     tags: [Sliders]
 *     summary: Get a slider by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slider retrieved successfully
 *       404:
 *         description: Slider not found
 *
 *   put:
 *     tags: [Sliders]
 *     summary: Update a slider
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
 *               captionEn:
 *                 type: string
 *               captionAr:
 *                 type: string
 *               imageEn:
 *                 type: string
 *                 format: binary
 *               imageAr:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Slider updated successfully
 *       404:
 *         description: Slider not found
 *
 *   delete:
 *     tags: [Sliders]
 *     summary: Delete a slider
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slider deleted successfully
 *       404:
 *         description: Slider not found
 */

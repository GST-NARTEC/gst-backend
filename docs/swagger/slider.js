/**
 * @swagger
 * components:
 *   schemas:
 *     Slider:
 *       type: object
 *       properties:
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
 *         status:
 *           type: number
 *           enum: [0, 1]
 *
 * /slider/v1:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new slider
 *     tags: [Slider]
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
 *                 type: number
 *     responses:
 *       201:
 *         description: Slider created successfully
 *
 *   get:
 *     summary: Get all sliders
 *     tags: [Slider]
 *     responses:
 *       200:
 *         description: List of sliders retrieved successfully
 *
 * /slider/v1/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a slider
 *     tags: [Slider]
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
 *             $ref: '#/components/schemas/Slider'
 *     responses:
 *       200:
 *         description: Slider updated successfully
 *
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a slider
 *     tags: [Slider]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slider deleted successfully
 */

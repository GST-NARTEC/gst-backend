/**
 * @swagger
 * components:
 *   schemas:
 *     SmartSolution:
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
 *         date:
 *           type: string
 *           format: date-time
 *         image:
 *           type: string
 *         captionEn:
 *           type: string
 *         captionAr:
 *           type: string
 *         isActive:
 *           type: boolean
 *         pageId:
 *           type: string
 *           description: ID of the associated page
 *         page:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nameEn:
 *               type: string
 *             nameAr:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/smart-solution/v1:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new smart solution
 *     tags: [SmartSolution]
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
 *               date:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *               captionEn:
 *                 type: string
 *               captionAr:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               pageId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Smart Solution created successfully
 *
 *   get:
 *     summary: Get all smart solutions
 *     tags: [SmartSolution]
 *     responses:
 *       200:
 *         description: List of smart solutions retrieved successfully
 *
 * /api/smart-solution/v1/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a smart solution
 *     tags: [SmartSolution]
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
 *             $ref: '#/components/schemas/SmartSolution'
 *     responses:
 *       200:
 *         description: Smart Solution updated successfully
 *
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a smart solution
 *     tags: [SmartSolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Smart Solution deleted successfully
 */

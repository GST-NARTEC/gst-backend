/**
 * @swagger
 * components:
 *   schemas:
 *     CoreSolution:
 *       type: object
 *       properties:
 *         titleEn:
 *           type: string
 *         titleAr:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         image:
 *           type: string
 *
 * /core-solution/v1:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new core solution
 *     tags: [CoreSolution]
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
 *               date:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Core Solution created successfully
 *
 *   get:
 *     summary: Get all core solutions
 *     tags: [CoreSolution]
 *     responses:
 *       200:
 *         description: List of core solutions retrieved successfully
 *
 * /core-solution/v1/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a core solution
 *     tags: [CoreSolution]
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
 *             $ref: '#/components/schemas/CoreSolution'
 *     responses:
 *       200:
 *         description: Core Solution updated successfully
 *
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a core solution
 *     tags: [CoreSolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Core Solution deleted successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Standard VAT"
 *         description:
 *           type: string
 *           example: "Standard VAT rate for general goods and services"
 *         value:
 *           type: number
 *           example: 15
 *         type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *           example: PERCENTAGE
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/vat/v1:
 *   post:
 *     tags: [VAT]
 *     summary: Create a new VAT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - value
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Standard VAT"
 *               description:
 *                 type: string
 *                 example: "Standard VAT rate for general goods and services"
 *               value:
 *                 type: number
 *                 example: 15
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *                 example: PERCENTAGE
 *     responses:
 *       201:
 *         description: VAT created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 *   get:
 *     tags: [VAT]
 *     summary: Get all VATs
 *     responses:
 *       200:
 *         description: VATs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/vat/v1/{id}:
 *   get:
 *     tags: [VAT]
 *     summary: Get a VAT by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: VAT retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 *   put:
 *     tags: [VAT]
 *     summary: Update a VAT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - type
 *             properties:
 *               value:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *     responses:
 *       200:
 *         description: VAT updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 *   delete:
 *     tags: [VAT]
 *     summary: Delete a VAT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: VAT deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/vat/v1/active:
 *   get:
 *     tags: [VAT]
 *     summary: Get active VAT configuration
 *     description: Retrieves the currently active VAT configuration
 *     responses:
 *       200:
 *         description: Active VAT retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Active VAT retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     vat:
 *                       $ref: '#/components/schemas/Vat'
 *       404:
 *         description: No active VAT found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

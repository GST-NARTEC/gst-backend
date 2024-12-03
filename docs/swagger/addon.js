/**
 * @swagger
 * components:
 *   schemas:
 *     Addon:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - unit
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           description: Name of the addon
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Price of the addon
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., portion, piece)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/addons:
 *   post:
 *     tags: [Addons]
 *     summary: Create a    new addon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Addon'
 *     responses:
 *       201:
 *         description: Addon created successfully
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
 *                   example: Addon created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     addon:
 *                       $ref: '#/components/schemas/Addon'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /api/v1/addons/active:
 *   get:
 *     tags: [Addons]
 *     summary: Get all active addons
 *     description: Retrieves all addons with status 'active'
 *     responses:
 *       200:
 *         description: List of active addons
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
 *                   example: Active addons retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     addons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Addon'
 */

/**
 * @swagger
 * /api/v1/addons/{id}:
 *   delete:
 *     tags: [Addons]
 *     summary: Delete an addon
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the addon to delete
 *     responses:
 *       200:
 *         description: Addon deleted successfully
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
 *                   example: Addon deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

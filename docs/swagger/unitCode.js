// docs/swagger/unitCode.js
/**
 * @swagger
 * components:
 *   schemas:
 *     UnitCode:
 *       type: object
 *       required:
 *         - code
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/unit-codes:
 *   post:
 *     summary: Create a new unit code
 *     tags: [UnitCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - description
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Unit code created successfully
 *       400:
 *         description: Invalid input
 *
 *   get:
 *     summary: Get paginated unit codes
 *     tags: [UnitCodes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [code, description, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /api/v1/unit-codes/all:
 *   get:
 *     summary: Get all unit codes without pagination
 *     tags: [UnitCodes]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /api/v1/unit-codes/{id}:
 *   get:
 *     summary: Get a unit code by ID
 *     tags: [UnitCodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Unit code not found
 *
 *   put:
 *     summary: Update a unit code
 *     tags: [UnitCodes]
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
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Unit code updated successfully
 *       404:
 *         description: Unit code not found
 *
 *   delete:
 *     summary: Delete a unit code
 *     tags: [UnitCodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit code deleted successfully
 *       404:
 *         description: Unit code not found
 */

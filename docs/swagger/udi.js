// docs/swagger/udi.js
/**
 * @swagger
 * components:
 *   schemas:
 *     UDI:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The UDI ID
 *         batchNo:
 *           type: string
 *           description: Batch number
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Expiry date
 *         gtin:
 *           type: string
 *           description: Global Trade Item Number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/udis:
 *   post:
 *     summary: Create a new UDI
 *     tags: [UDI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gtin
 *             properties:
 *               batchNo:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               gtin:
 *                 type: string
 *     responses:
 *       201:
 *         description: UDI created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all UDIs
 *     tags: [UDI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gtin
 *         schema:
 *           type: string
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
 *           enum: [batchNo, expiryDate, gtin, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of UDIs
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/udis/{id}:
 *   get:
 *     summary: Get a UDI by ID
 *     tags: [UDI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UDI details
 *       404:
 *         description: UDI not found
 *
 *   delete:
 *     summary: Delete a UDI
 *     tags: [UDI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UDI deleted successfully
 *       404:
 *         description: UDI not found
 */

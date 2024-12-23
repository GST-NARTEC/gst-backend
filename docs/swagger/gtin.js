/**
 * @swagger
 * components:
 *   schemas:
 *     GTIN:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         gtin:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Available, Sold, Used]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/gtins/upload:
 *   post:
 *     summary: Upload GTIN file
 *     tags: [GTIN]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: File processing started
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/v1/gtins/bulk:
 *   post:
 *     summary: Add multiple GTINs
 *     tags: [GTIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gtins:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       202:
 *         description: GTINs processing started
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/v1/gtins:
 *   get:
 *     summary: Get GTINs with pagination and filters
 *     tags: [GTIN]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Sold, Used]
 *     responses:
 *       200:
 *         description: List of GTINs
 */

/**
 * @swagger
 * /api/v1/gtins/stats:
 *   get:
 *     summary: Get GTIN statistics
 *     tags: [GTIN]
 *     responses:
 *       200:
 *         description: GTIN statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Available:
 *                   type: integer
 *                 Sold:
 *                   type: integer
 *                 Used:
 *                   type: integer
 */

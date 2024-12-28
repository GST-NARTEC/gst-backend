// docs/swagger/aggregation.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Aggregation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *         serialNo:
 *           type: string
 *           description: Automatically generated serial number (GTIN-BATCH-ID format)
 *         qty:
 *           type: integer
 *           description: Quantity of records to generate
 *         batchNo:
 *           type: string
 *           description: Batch number for the aggregation
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         manufacturingDate:
 *           type: string
 *           format: date-time
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
 * /api/v1/aggregations:
 *   post:
 *     tags: [Aggregations]
 *     summary: Create multiple aggregation records using a worker queue
 *     description: Creates specified quantity of aggregation records with auto-generated serial numbers
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
 *               - batchNo
 *               - qty
 *             properties:
 *               gtin:
 *                 type: string
 *                 description: Global Trade Item Number
 *               batchNo:
 *                 type: string
 *                 description: Batch number for the aggregation
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of records to generate
 *     responses:
 *       201:
 *         description: Aggregation job queued successfully
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
 *                   example: Aggregation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags: [Aggregations]
 *     summary: Get all aggregations with pagination and search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by batch number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, batchNo, gtin]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of aggregations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     aggregations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Aggregation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */

/**
 * @swagger
 * /api/v1/aggregations/{id}:
 *   put:
 *     tags: [Aggregations]
 *     summary: Update an aggregation record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Aggregation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchNo:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               manufacturingDate:
 *                 type: string
 *                 format: date-time
 *               gtin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Aggregation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     aggregation:
 *                       $ref: '#/components/schemas/Aggregation'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Aggregation not found
 *
 *   delete:
 *     tags: [Aggregations]
 *     summary: Delete an aggregation record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Aggregation ID
 *     responses:
 *       200:
 *         description: Aggregation deleted successfully
 *       404:
 *         description: Aggregation not found
 */

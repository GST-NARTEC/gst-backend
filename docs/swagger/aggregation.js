// docs/swagger/aggregation.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Aggregation:
 *       type: object
 *       required:
 *         - gtin
 *         - qty
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           readOnly: true
 *         serialNo:
 *           type: string
 *           readOnly: true
 *           description: "Auto-generated serial number (format: GTIN-BATCH-ID)"
 *         gtin:
 *           type: string
 *           description: "Global Trade Item Number"
 *         qty:
 *           type: integer
 *           minimum: 0
 *           description: "Quantity of records to generate"
 *         batchNo:
 *           type: string
 *           nullable: true
 *           description: "Batch number for the aggregation"
 *         manufacturingDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: "Manufacturing date of the product"
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: "Expiry date of the product"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *
 *   responses:
 *     AggregationSuccess:
 *       description: Operation successful
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *               success:
 *                 type: boolean
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *                 properties:
 *                   aggregation:
 *                     $ref: '#/components/schemas/Aggregation'
 *
 * /api/v1/aggregations:
 *   post:
 *     tags:
 *       - Aggregations
 *     summary: "Create multiple aggregation records using worker queue"
 *     description: "Creates specified quantity of aggregation records with auto-generated serial numbers"
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
 *               - qty
 *             properties:
 *               gtin:
 *                 type: string
 *                 description: "Global Trade Item Number"
 *               qty:
 *                 type: integer
 *                 minimum: 0
 *                 description: "Number of records to generate"
 *               batchNo:
 *                 type: string
 *                 nullable: true
 *                 description: "Batch number for the aggregation"
 *               manufacturingDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: "Manufacturing date of the product"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: "Expiry date of the product"
 *     responses:
 *       201:
 *         description: "Aggregation job queued successfully"
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
 *                   example: "Aggregation created successfully"
 *
 *   get:
 *     tags:
 *       - Aggregations
 *     summary: "Get all aggregations with pagination and search"
 *     security:
 *       - bearerAuth: []
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
 *         description: "Search by batch number"
 *       - in: query
 *         name: gtin
 *         schema:
 *           type: string
 *         description: "Search by gtin"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [qty, batchNo, manufacturingDate, expiryDate, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: "List of aggregations"
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
 *                         $ref: "#/components/schemas/Aggregation"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *
 * /api/v1/aggregations/{id}:
 *   put:
 *     tags:
 *       - Aggregations
 *     summary: "Update an aggregation record"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Aggregation ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchNo:
 *                 type: string
 *                 nullable: true
 *               manufacturingDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: "Aggregation updated successfully"
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
 *                       $ref: "#/components/schemas/Aggregation"
 *       404:
 *         description: "Aggregation not found"
 *
 *   delete:
 *     tags:
 *       - Aggregations
 *     summary: "Delete an aggregation record"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Aggregation ID"
 *     responses:
 *       200:
 *         description: "Aggregation deleted successfully"
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
 *                   example: "Aggregation deleted successfully"
 */

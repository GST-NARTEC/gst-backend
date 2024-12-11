/**
 * @swagger
 * components:
 *   schemas:
 *     UserProduct:
 *       type: object
 *       required:
 *         - title
 *         - sku
 *       properties:
 *         title:
 *           type: string
 *           description: Product title
 *         description:
 *           type: string
 *           description: Product description
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           default: ACTIVE
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit
 *         gtin:
 *           type: string
 *           description: Global Trade Item Number
 *         gpc:
 *           type: string
 *           description: Global Product Classification
 *         hsCode:
 *           type: string
 *           description: Harmonized System Code
 *         packingUnit:
 *           type: string
 *         unitOfMeasure:
 *           type: string
 *         brandName:
 *           type: string
 *         countryOfOrigin:
 *           type: string
 *         countryOfSale:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *
 * @swagger
 * /api/v1/user-products:
 *   post:
 *     tags:
 *       - User Products
 *     summary: Create a new user product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               gtin:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - User Products
 *     summary: List user products
 *     security:
 *       - bearerAuth: []
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
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Unauthorized
 *
 * /api/v1/user-products/{id}:
 *   get:
 *     tags:
 *       - User Products
 *     summary: Get a single product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *
 *   put:
 *     tags:
 *       - User Products
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *
 *   delete:
 *     tags:
 *       - User Products
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

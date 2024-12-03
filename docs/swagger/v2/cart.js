/**
 * @swagger
 * components:
 *   schemas:
 *     CartItemV2:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         addons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Addon'
 *
 * /api/cart/v2/add:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add items with optional addons to anonymous cart
 *     description: Creates a new anonymous cart and adds items with their addons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     addons:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *     responses:
 *       200:
 *         description: Cart created and items added successfully
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
 *                   example: Items added to cart successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [ANONYMOUS]
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/CartItemV2'
 *                         subtotal:
 *                           type: number
 *                           description: Total price including products and addons
 *       400:
 *         description: Invalid request body or inactive products/addons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: One or more products/addons are invalid or inactive
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

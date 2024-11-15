/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *         productId:
 *           type: string
 *           format: uuid
 *         product:
 *           $ref: '#/components/schemas/Product'
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         paymentType:
 *           type: string
 *           enum: [Bank Transfer, Visa / Master Card, Credit/Debit card, STC Pay, Tabby]
 *         totalAmount:
 *           type: number
 *         vat:
 *           type: number
 *         overallAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/checkout/v1/process:
 *   post:
 *     tags: [Checkout]
 *     summary: Process checkout and create order
 *     description: Creates order, generates invoice, sends confirmation email with credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - paymentType
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               paymentType:
 *                 type: string
 *                 enum: [Bank Transfer, Visa / Master Card, Credit/Debit card, STC Pay, Tabby]
 *     responses:
 *       200:
 *         description: Checkout processed successfully
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
 *                   example: Order placed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (empty cart)
 *       500:
 *         description: Server error
 */

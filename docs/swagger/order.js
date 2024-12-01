/**
 * @swagger
 * /api/v1/orders/bank-slip:
 *   post:
 *     summary: Upload bank slip for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               orderNumber:
 *                 type: string
 *                 description: Order number
 *               bankSlip:
 *                 type: string
 *                 format: binary
 *                 description: Bank slip file
 *     responses:
 *       200:
 *         description: Bank slip uploaded successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *
 * /api/v1/orders/bank-slip/{orderNumber}:
 *   delete:
 *     summary: Delete bank slip for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bank slip deleted successfully
 *       404:
 *         description: Order or bank slip not found
 *
 * /api/v1/orders/activate/{orderNumber}:
 *   patch:
 *     summary: Activate user account for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number to activate
 *     responses:
 *       200:
 *         description: Account activated successfully
 *       400:
 *         description: Invalid order status
 *       404:
 *         description: Order not found
 */

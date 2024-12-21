/**
 * @swagger
 * components:
 *   schemas:
 *     HelpTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *           default: OPEN
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *           default: MEDIUM
 *         category:
 *           type: string
 *           enum: [ACCOUNT, ORDER, PRODUCT, PAYMENT, OTHER]
 *           default: OTHER
 *         response:
 *           type: string
 *         doc:
 *           type: string
 *           description: URL to the uploaded document
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     SortField:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *           enum: [status, priority, category]
 *         order:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 */

/**
 * @swagger
 * /api/v1/help-tickets:
 *   post:
 *     summary: Create a new help ticket
 *     tags: [HelpTickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *               category:
 *                 type: string
 *                 enum: [ACCOUNT, ORDER, PRODUCT, PAYMENT, OTHER]
 *                 default: OTHER
 *               doc:
 *                 type: string
 *                 format: binary
 *                 description: Supporting document (image only)
 *     responses:
 *       201:
 *         description: Help ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Help ticket created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/HelpTicket'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all help tickets with pagination, search and filtering
 *     tags: [HelpTickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in subject and message
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter by ticket priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [ACCOUNT, ORDER, PRODUCT, PAYMENT, OTHER]
 *         description: Filter by ticket category
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: Help tickets retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HelpTicket'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         limit:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/help-tickets/{id}:
 *   get:
 *     summary: Get a help ticket by ID
 *     tags: [HelpTickets]
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
 *         description: Success
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
 *                   example: Help ticket retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/HelpTicket'
 *       404:
 *         description: Help ticket not found
 *
 *   patch:
 *     summary: Update a help ticket
 *     tags: [HelpTickets]
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
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               category:
 *                 type: string
 *                 enum: [ACCOUNT, ORDER, PRODUCT, PAYMENT, OTHER]
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Help ticket updated successfully
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
 *                   example: Help ticket updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/HelpTicket'
 *       404:
 *         description: Help ticket not found
 *
 *   delete:
 *     summary: Delete a help ticket
 *     tags: [HelpTickets]
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
 *         description: Help ticket deleted successfully
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
 *                   example: Help ticket deleted successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Help ticket not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - status
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *         image:
 *           type: string
 *         subMenus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubMenu'
 */

/**
 * @swagger
 * /api/menu/v1:
 *   get:
 *     summary: Get all menus with optional pagination and search
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for nameEn or nameAr (case insensitive)
 *     responses:
 *       200:
 *         description: Successful operation
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
 *                   example: Menus retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     menus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Menu'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 */

/**
 * @swagger
 * /api/menu/v1:
 *   get:
 *     tags: [Menus]
 *     summary: Get all menus
 *     responses:
 *       200:
 *         description: Success
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
 *                     menus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Menu'
 *
 *   post:
 *     tags: [Menus]
 *     summary: Create a new menu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - status
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *               image:
 *                 type: string
 *                 format: binary
 *
 * /api/menu/v1/{id}:
 *   get:
 *     tags: [Menus]
 *     summary: Get menu by ID
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
 *               $ref: '#/components/schemas/Menu'
 *
 *   put:
 *     tags: [Menus]
 *     summary: Update menu
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
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *               image:
 *                 type: string
 *                 format: binary
 *
 *   delete:
 *     tags: [Menus]
 *     summary: Delete menu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

/**
 * @swagger
 * /api/menu/v1/active:
 *   get:
 *     tags: [Menus]
 *     summary: Get all active menus (status = 1)
 *     description: Retrieves all menus with status 1, including their submenus and associated pages
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: Active menus retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     menus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           nameEn:
 *                             type: string
 *                           nameAr:
 *                             type: string
 *                           status:
 *                             type: integer
 *                             enum: [1]
 *                           image:
 *                             type: string
 *                           subMenus:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 nameEn:
 *                                   type: string
 *                                 nameAr:
 *                                   type: string
 *                                 headingEn:
 *                                   type: string
 *                                 headingAr:
 *                                   type: string
 *                                 page:
 *                                   $ref: '#/components/schemas/Page'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 data:
 *                   type: null
 */

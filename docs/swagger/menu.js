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
 * /api/menus:
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
 * /api/menus/{id}:
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

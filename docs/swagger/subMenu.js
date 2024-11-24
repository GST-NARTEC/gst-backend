/**
 * @swagger
 * components:
 *   schemas:
 *     SubMenu:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - menuId
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         headingEn:
 *           type: string
 *         headingAr:
 *           type: string
 *         menuId:
 *           type: string
 *
 * /api/submenus:
 *   get:
 *     tags: [SubMenus]
 *     summary: Get all submenus
 *     parameters:
 *       - in: query
 *         name: menuId
 *         schema:
 *           type: string
 *         description: Filter by menu ID
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
 *                     subMenus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubMenu'
 *
 *   post:
 *     tags: [SubMenus]
 *     summary: Create a new submenu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - menuId
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               headingEn:
 *                 type: string
 *               headingAr:
 *                 type: string
 *               menuId:
 *                 type: string
 *
 * /api/submenus/{id}:
 *   get:
 *     tags: [SubMenus]
 *     summary: Get submenu by ID
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
 *               $ref: '#/components/schemas/SubMenu'
 *
 *   put:
 *     tags: [SubMenus]
 *     summary: Update submenu
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
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               headingEn:
 *                 type: string
 *               headingAr:
 *                 type: string
 *               menuId:
 *                 type: string
 *
 *   delete:
 *     tags: [SubMenus]
 *     summary: Delete submenu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

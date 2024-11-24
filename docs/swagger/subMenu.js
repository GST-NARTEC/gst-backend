/**
 * @swagger
 * components:
 *   schemas:
 *     SubMenu:
 *       type: object
 *       properties:
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
 * /submenu/v1:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new submenu
 *     tags: [SubMenu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubMenu'
 *     responses:
 *       201:
 *         description: SubMenu created successfully
 *
 *   get:
 *     summary: Get all submenus
 *     tags: [SubMenu]
 *     responses:
 *       200:
 *         description: List of submenus retrieved successfully
 *
 * /submenu/v1/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a submenu
 *     tags: [SubMenu]
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
 *             $ref: '#/components/schemas/SubMenu'
 *     responses:
 *       200:
 *         description: SubMenu updated successfully
 *
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a submenu
 *     tags: [SubMenu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubMenu deleted successfully
 */

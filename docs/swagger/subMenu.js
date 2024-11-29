/**
 * @swagger
 * components:
 *   schemas:
 *     SubMenuCreate:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - menuId
 *       properties:
 *         nameEn:
 *           type: string
 *           description: SubMenu name in English
 *         nameAr:
 *           type: string
 *           description: SubMenu name in Arabic
 *         headingEn:
 *           type: string
 *           description: Optional heading in English
 *         headingAr:
 *           type: string
 *           description: Optional heading in Arabic
 *         menuId:
 *           type: string
 *           description: ID of the parent menu
 *         pageId:
 *           type: string
 *           description: Optional ID of the linked page
 *
 *     SubMenuUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         nameEn:
 *           type: string
 *           description: SubMenu name in English
 *         nameAr:
 *           type: string
 *           description: SubMenu name in Arabic
 *         headingEn:
 *           type: string
 *           description: Optional heading in English
 *         headingAr:
 *           type: string
 *           description: Optional heading in Arabic
 *         menuId:
 *           type: string
 *           description: ID of the parent menu
 *         pageId:
 *           type: string
 *           description: Optional ID of the linked page
 *
 *     SubMenu:
 *       type: object
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
 *         pageId:
 *           type: string
 *         menu:
 *           $ref: '#/components/schemas/Menu'
 *         page:
 *           $ref: '#/components/schemas/Page'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/submenu/v1:
 *   post:
 *     summary: Create a new submenu
 *     tags: [SubMenus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubMenuCreate'
 *     responses:
 *       201:
 *         description: SubMenu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subMenu:
 *                       $ref: '#/components/schemas/SubMenu'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Menu or Page not found
 *
 *   get:
 *     summary: Get all submenus with optional pagination and search
 *     tags: [SubMenus]
 *     parameters:
 *       - in: query
 *         name: menuId
 *         schema:
 *           type: string
 *         description: Filter by menu ID
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
 *                   example: SubMenus retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     subMenus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubMenu'
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
 *
 * /api/submenu/v1/{id}:
 *   get:
 *     summary: Get a submenu by ID
 *     tags: [SubMenus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubMenu details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subMenu:
 *                       $ref: '#/components/schemas/SubMenu'
 *       404:
 *         description: SubMenu not found
 *
 *   put:
 *     summary: Update a submenu
 *     tags: [SubMenus]
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
 *             $ref: '#/components/schemas/SubMenuUpdate'
 *     responses:
 *       200:
 *         description: SubMenu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subMenu:
 *                       $ref: '#/components/schemas/SubMenu'
 *       400:
 *         description: Invalid input or no fields provided
 *       404:
 *         description: SubMenu, Menu, or Page not found
 *
 *   delete:
 *     summary: Delete a submenu
 *     tags: [SubMenus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubMenu deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: SubMenu not found
 */

/**
 * @swagger
 * /submenu:
 *   post:
 *     summary: Create a new submenu
 *     tags: [SubMenu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - headingEn
 *               - headingAr
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
 *     responses:
 *       201:
 *         description: SubMenu created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Menu not found
 *
 *   get:
 *     summary: Get all submenus
 *     tags: [SubMenu]
 *     parameters:
 *       - in: query
 *         name: menuId
 *         schema:
 *           type: string
 *         description: Filter submenus by menu ID
 *     responses:
 *       200:
 *         description: List of submenus
 *
 * /submenu/{id}:
 *   get:
 *     summary: Get a submenu by ID
 *     tags: [SubMenu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubMenu details
 *       404:
 *         description: SubMenu not found
 *
 *   put:
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
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - headingEn
 *               - headingAr
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
 *     responses:
 *       200:
 *         description: SubMenu updated successfully
 *       404:
 *         description: SubMenu not found
 *
 *   delete:
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
 *       404:
 *         description: SubMenu not found
 */

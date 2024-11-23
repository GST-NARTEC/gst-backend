/**
 * @swagger
 * /menu:
 *   post:
 *     summary: Create a new menu
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 type: number
 *                 enum: [0, 1]
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       400:
 *         description: Invalid input
 *
 *   get:
 *     summary: Get all menus
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of all menus
 *
 * /menu/active:
 *   get:
 *     summary: Get all active menus
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of active menus
 *
 * /menu/{id}:
 *   get:
 *     summary: Get a menu by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu details
 *       404:
 *         description: Menu not found
 *
 *   put:
 *     summary: Update a menu
 *     tags: [Menu]
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
 *               - status
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               status:
 *                 type: number
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *       404:
 *         description: Menu not found
 *
 *   delete:
 *     summary: Delete a menu
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       404:
 *         description: Menu not found
 */

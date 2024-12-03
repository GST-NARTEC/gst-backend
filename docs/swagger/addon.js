/**
 * @swagger
 * components:
 *   schemas:
 *     Addon:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - unit
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the addon
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Price of the addon
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *
 * /api/v1/addons:
 *   post:
 *     tags: [Addons]
 *     summary: Create a new addon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Addon'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *
 *   get:
 *     tags: [Addons]
 *     summary: Get all addons
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AddonsList'
 *
 * /api/v1/addons/active:
 *   get:
 *     tags: [Addons]
 *     summary: Get active addons
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AddonsList'
 *
 * /api/v1/addons/{id}:
 *   patch:
 *     tags: [Addons]
 *     summary: Update an addon
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags: [Addons]
 *     summary: Delete an addon
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

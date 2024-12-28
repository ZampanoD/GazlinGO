package database

import (
	"backend/internal/models"
	"database/sql"
)

func (db *Database) GetAllMinerals() ([]models.Mineral, error) {
	query := `
        SELECT id, title, description, model_path, preview_image_path, created_at
        FROM minerals
        ORDER BY id
    `

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var minerals []models.Mineral
	for rows.Next() {
		var m models.Mineral
		err := rows.Scan(
			&m.ID,
			&m.Title,
			&m.Description,
			&m.ModelPath,
			&m.PreviewImagePath,
			&m.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		minerals = append(minerals, m)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return minerals, nil
}

func (db *Database) GetMineralByID(id int) (*models.Mineral, error) {
	query := `
        SELECT id, title, description, model_path, preview_image_path, created_at 
        FROM minerals 
        WHERE id = $1
    `

	var mineral models.Mineral
	err := db.DB.QueryRow(query, id).Scan(
		&mineral.ID,
		&mineral.Title,
		&mineral.Description,
		&mineral.ModelPath,
		&mineral.PreviewImagePath,
		&mineral.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrMineralNotFound
	}
	if err != nil {
		return nil, err
	}
	return &mineral, nil
}

func (db *Database) CreateMineral(mineral models.Mineral) (*models.Mineral, error) {
	query := `
        INSERT INTO minerals (title, description, model_path, preview_image_path)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, description, model_path, preview_image_path, created_at
    `
	var created models.Mineral
	err := db.DB.QueryRow(
		query,
		mineral.Title,
		mineral.Description,
		mineral.ModelPath,
		mineral.PreviewImagePath,
	).Scan(
		&created.ID,
		&created.Title,
		&created.Description,
		&created.ModelPath,
		&created.PreviewImagePath,
		&created.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &created, nil
}

func (db *Database) UpdateMineral(mineral models.Mineral) (*models.Mineral, error) {
	query := `
        UPDATE minerals
        SET title = $1, description = $2, model_path = $3, preview_image_path = $4
        WHERE id = $5
        RETURNING id, title, description, model_path, preview_image_path, created_at
    `
	var updated models.Mineral
	err := db.DB.QueryRow(
		query,
		mineral.Title,
		mineral.Description,
		mineral.ModelPath,
		mineral.PreviewImagePath,
		mineral.ID,
	).Scan(
		&updated.ID,
		&updated.Title,
		&updated.Description,
		&updated.ModelPath,
		&updated.PreviewImagePath,
		&updated.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrMineralNotFound
	}
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

func (db *Database) DeleteMineral(id int) error {
	query := `DELETE FROM minerals WHERE id = $1`
	result, err := db.DB.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrMineralNotFound
	}
	return nil
}

func (db *Database) SearchMineralByTitle(query string) ([]models.Mineral, error) {
	sqlQuery := `
        SELECT id, title, description, model_path, preview_image_path, created_at
        FROM minerals
        WHERE title ILIKE $1
        ORDER BY title ASC
    `
	searchPattern := query + "%"
	rows, err := db.DB.Query(sqlQuery, searchPattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var minerals []models.Mineral
	for rows.Next() {
		var m models.Mineral
		err := rows.Scan(
			&m.ID,
			&m.Title,
			&m.Description,
			&m.ModelPath,
			&m.PreviewImagePath,
			&m.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		minerals = append(minerals, m)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return minerals, nil
}

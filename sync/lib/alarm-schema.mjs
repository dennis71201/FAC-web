/**
 * Alarm 資料表 schema 定義（用於 bulk insert）
 * 集中管理欄位定義，避免每個 job 重複寫一長串
 */
import sql from 'mssql';

/**
 * 建立 DBA02.Alarm 的 bulk insert Table 物件
 * DBA02 的 Alarm 欄位：21 source 欄 + UnAckDuration + source_factory + synced_at
 * （id 為 IDENTITY，不列入）
 */
export function makeDba02AlarmTable(tableName = 'dbo.Alarm') {
  const table = new sql.Table(tableName);
  table.create = false;

  table.columns.add('EventStamp',    sql.DateTime2(7),  { nullable: true });
  table.columns.add('AlarmState',    sql.NVarChar(9),   { nullable: true });
  table.columns.add('TagName',       sql.NVarChar(132), { nullable: true });
  table.columns.add('Description',   sql.NVarChar(255), { nullable: true });
  table.columns.add('Area',          sql.NVarChar(32),  { nullable: true });
  table.columns.add('Type',          sql.NVarChar(6),   { nullable: true });
  table.columns.add('Value',         sql.NVarChar(131), { nullable: true });
  table.columns.add('CheckValue',    sql.NVarChar(131), { nullable: true });
  table.columns.add('Priority',      sql.Int,           { nullable: true });
  table.columns.add('Category',      sql.NVarChar(8),   { nullable: true });
  table.columns.add('Provider',      sql.NVarChar(65),  { nullable: true });
  table.columns.add('Operator',      sql.NVarChar(131), { nullable: true });
  table.columns.add('DomainName',    sql.NVarChar(155), { nullable: true });
  table.columns.add('UserFullName',  sql.NVarChar(255), { nullable: true });
  table.columns.add('AlarmDuration', sql.NVarChar(4000),{ nullable: true }); // A 廠專屬
  table.columns.add('UnAckDuration', sql.NVarChar(17),  { nullable: true }); // B 廠專屬
  table.columns.add('User1',         sql.Float,         { nullable: true });
  table.columns.add('User2',         sql.Float,         { nullable: true });
  table.columns.add('User3',         sql.NVarChar(131), { nullable: true });
  table.columns.add('EventStampUTC', sql.DateTime2(7),  { nullable: true });
  table.columns.add('MilliSec',      sql.Int,           { nullable: true });
  table.columns.add('OperatorNode',  sql.NVarChar(131), { nullable: true });

  table.columns.add('source_factory', sql.VarChar(10),  { nullable: false });
  table.columns.add('synced_at',      sql.DateTime2(7), { nullable: false });

  return table;
}

/**
 * 新增一筆資料到 DBA02.Alarm bulk table
 * source 為 A 廠時 UnAckDuration 為 null；B 廠時 AlarmDuration 為 null
 */
export function addDba02AlarmRow(table, row, sourceFactory, syncedAt) {
  table.rows.add(
    row.EventStamp     ?? null,
    row.AlarmState     ?? null,
    row.TagName        ?? null,
    row.Description    ?? null,
    row.Area           ?? null,
    row.Type           ?? null,
    row.Value          ?? null,
    row.CheckValue     ?? null,
    row.Priority       ?? null,
    row.Category       ?? null,
    row.Provider       ?? null,
    row.Operator       ?? null,
    row.DomainName     ?? null,
    row.UserFullName   ?? null,
    row.AlarmDuration  ?? null,   // A 廠欄位，B 廠 source 不存在會是 undefined
    row.UnAckDuration  ?? null,   // B 廠欄位，A 廠 source 不存在會是 undefined
    row.User1          ?? null,
    row.User2          ?? null,
    row.User3          ?? null,
    row.EventStampUTC  ?? null,
    row.MilliSec       ?? null,
    row.OperatorNode   ?? null,
    sourceFactory,
    syncedAt,
  );
}

/**
 * 建立 B 廠 Alarm 的 bulk insert Table 物件
 * 用於 B1SA01 → DBA03 的同 schema 搬運
 * 型別：datetime / smallint（B 廠原型別）；UnAckDuration 17 字元
 */
export function makeBFactoryAlarmTable() {
  const table = new sql.Table('dbo.Alarm');
  table.create = false;

  table.columns.add('EventStamp',    sql.DateTime,      { nullable: true });
  table.columns.add('AlarmState',    sql.NVarChar(9),   { nullable: true });
  table.columns.add('TagName',       sql.NVarChar(132), { nullable: true });
  table.columns.add('Description',   sql.NVarChar(255), { nullable: true });
  table.columns.add('Area',          sql.NVarChar(32),  { nullable: true });
  table.columns.add('Type',          sql.NVarChar(6),   { nullable: true });
  table.columns.add('Value',         sql.NVarChar(131), { nullable: true });
  table.columns.add('CheckValue',    sql.NVarChar(131), { nullable: true });
  table.columns.add('Priority',      sql.SmallInt,      { nullable: true });
  table.columns.add('Category',      sql.NVarChar(8),   { nullable: true });
  table.columns.add('Provider',      sql.NVarChar(65),  { nullable: true });
  table.columns.add('Operator',      sql.NVarChar(131), { nullable: true });
  table.columns.add('DomainName',    sql.NVarChar(155), { nullable: true });
  table.columns.add('UserFullName',  sql.NVarChar(255), { nullable: true });
  table.columns.add('UnAckDuration', sql.NVarChar(17),  { nullable: true });
  table.columns.add('User1',         sql.Float,         { nullable: true });
  table.columns.add('User2',         sql.Float,         { nullable: true });
  table.columns.add('User3',         sql.NVarChar(131), { nullable: true });
  table.columns.add('EventStampUTC', sql.DateTime,      { nullable: true });
  table.columns.add('MilliSec',      sql.SmallInt,      { nullable: true });
  table.columns.add('OperatorNode',  sql.NVarChar(131), { nullable: true });

  return table;
}

/** 新增一筆 B 廠 Alarm 到 bulk table（B1SA01 → DBA03 用） */
export function addBFactoryAlarmRow(table, row) {
  table.rows.add(
    row.EventStamp    ?? null,
    row.AlarmState    ?? null,
    row.TagName       ?? null,
    row.Description   ?? null,
    row.Area          ?? null,
    row.Type          ?? null,
    row.Value         ?? null,
    row.CheckValue    ?? null,
    row.Priority      ?? null,
    row.Category      ?? null,
    row.Provider      ?? null,
    row.Operator      ?? null,
    row.DomainName    ?? null,
    row.UserFullName  ?? null,
    row.UnAckDuration ?? null,
    row.User1         ?? null,
    row.User2         ?? null,
    row.User3         ?? null,
    row.EventStampUTC ?? null,
    row.MilliSec      ?? null,
    row.OperatorNode  ?? null,
  );
}

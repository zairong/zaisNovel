import React from 'react';
import BooGhost from './BooGhost';
import classes from './BooTest.module.scss';

const BooTest = () => {
  return (
    <div className={classes.booTest}>
      <h1 className={classes.title}>害羞幽靈（Boo）精確重現</h1>
      <p className={classes.description}>
        根據圖片特徵完全重新設計的害羞幽靈，力求與原圖一模一樣
      </p>
      
      <div className={classes.features}>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>👻</span>
          <span>更圓的梨形身體：頂部較寬、底部收窄的可愛形狀</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>👁️</span>
          <span>分離的黑色橢圓形眼睛，彼此靠近，略微向下傾斜</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>🤨</span>
          <span>可愛的彎曲眉毛，增加表情豐富度</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>🦷</span>
          <span>張開的大嘴，露出雪白色的尖銳獠牙</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>👅</span>
          <span>亮粉色舌頭，短而粗，舌尖略微捲曲</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>🤲</span>
          <span>小巧、圓潤的短臂從身體兩側伸出</span>
        </div>
        <div className={classes.feature}>
          <span className={classes.featureIcon}>🐾</span>
          <span>可愛的小尾巴，增加萌度</span>
        </div>
      </div>
      
      <div className={classes.ghostShowcase}>
        <div className={classes.ghostContainer}>
          <div className={classes.ghostItem}>
            <BooGhost className={classes.ghost1} />
            <span className={classes.ghostLabel}>標準大小</span>
          </div>
          <div className={classes.ghostItem}>
            <BooGhost className={classes.ghost2} />
            <span className={classes.ghostLabel}>放大版本</span>
          </div>
          <div className={classes.ghostItem}>
            <BooGhost className={classes.ghost3} />
            <span className={classes.ghostLabel}>縮小版本</span>
          </div>
        </div>
      </div>
      
      <div className={classes.comparison}>
        <h2>設計特徵對比</h2>
        <div className={classes.comparisonGrid}>
          <div className={classes.comparisonItem}>
            <h3>改進要求</h3>
            <ul>
              <li>眼睛分離，不要融合在一起</li>
              <li>嘴巴要更大</li>
              <li>舌頭要短而粗，不要太細太長</li>
              <li>牙齒要雪白色，不要太細</li>
              <li>添加可愛的眉毛</li>
              <li>整體要更可愛</li>
              <li>體型要更圓</li>
              <li>添加小尾巴</li>
            </ul>
          </div>
          <div className={classes.comparisonItem}>
            <h3>實現效果</h3>
            <ul>
              <li>✅ 眼睛完全分離，位置準確</li>
              <li>✅ 嘴巴更大更明顯</li>
              <li>✅ 舌頭短而粗，比例適中</li>
              <li>✅ 雪白色牙齒，更粗更明顯</li>
              <li>✅ 可愛的彎曲眉毛</li>
              <li>✅ 整體更可愛，表情豐富</li>
              <li>✅ 更圓的體型，更萌</li>
              <li>✅ 可愛的小尾巴</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={classes.details}>
        <h2>細節說明</h2>
        <div className={classes.detailsGrid}>
          <div className={classes.detailItem}>
            <h3>身體設計</h3>
            <p>使用精確的梨形輪廓，頂部較寬、底部收窄，完全符合圖片中的淚滴狀外型。邊緣非常柔和，營造幽靈的飄逸感。</p>
          </div>
          <div className={classes.detailItem}>
            <h3>臉部特徵</h3>
            <p>眼睛小而黑，橢圓形，彼此靠近，略微向下傾斜，完美重現害羞表情。嘴巴張開，內部深色，露出尖銳的白色獠牙。</p>
          </div>
          <div className={classes.detailItem}>
            <h3>舌頭設計</h3>
            <p>亮粉色舌頭，長而粗，從嘴巴中伸出，舌尖略微捲曲，完全符合圖片中的特徵。</p>
          </div>
          <div className={classes.detailItem}>
            <h3>短臂位置</h3>
            <p>小巧、圓潤的短臂從身體兩側伸出，位置在身體中部偏下，與圖片中的位置完全一致。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooTest; 